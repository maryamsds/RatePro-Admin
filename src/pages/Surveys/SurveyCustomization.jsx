// src\pages\Surveys\SurveyCustomization.jsx
"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Container, Row, Col, Card, Form, Button, Tab, Nav, Alert } from "react-bootstrap"
import { MdSave, MdPreview, MdPalette, MdImage, MdBrush } from "react-icons/md"

const SurveyCustomization = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [customization, setCustomization] = useState({
    // Branding
    logo: "",
    companyName: "Rate Pro",
    primaryColor: "var(--bs-primary)",
    secondaryColor: "var(--bs-secondary)",
    backgroundColor: "var(--bs-body-bg)",
    textColor: "var(--bs-body-color)",

    // Layout
    theme: "modern",
    layout: "centered",
    progressBar: true,
    questionNumbers: true,

    // Custom CSS
    customCss: "",

    // Survey Settings
    welcomeMessage: "Welcome to our survey",
    thankYouMessage: "Thank you for your participation",
    footerText: "Powered by Rate Pro",

    // Advanced
    favicon: "",
    customDomain: "",
    embedCode: "",
  })

  useEffect(() => {
    // Simulate loading customization data
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [id])

  const handleChange = (field, value) => {
    setCustomization((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    console.log("Saving customization:", customization)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const generateEmbedCode = () => {
    const embedCode = `<iframe src="https://ratepro.com/survey/${id}" width="100%" height="600" frameborder="0"></iframe>`
    setCustomization((prev) => ({ ...prev, embedCode }))
  }

  const themes = [
    { id: "modern", name: "Modern", preview: "Clean and minimal design" },
    { id: "classic", name: "Classic", preview: "Traditional form layout" },
    { id: "material", name: "Material", preview: "Google Material Design" },
    { id: "bootstrap", name: "Bootstrap", preview: "Bootstrap-styled components" },
  ]

  const layouts = [
    { id: "centered", name: "Centered", description: "Questions centered on page" },
    { id: "left-aligned", name: "Left Aligned", description: "Questions aligned to left" },
    { id: "full-width", name: "Full Width", description: "Questions span full width" },
  ]

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading customization options...</p>
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
              <h1 className="h3 mb-1">Survey Customization</h1>
              <p className="text-muted mb-0">Customize the look and feel of your survey</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-primary">
                <MdPreview className="me-2" />
                Preview
              </Button>
              <Button variant="primary" onClick={handleSave}>
                <MdSave className="me-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {saved && (
        <Alert variant="success" className="mb-4">
          Customization settings saved successfully!
        </Alert>
      )}

      <Row>
        {/* Customization Options */}
        <Col lg={8}>
          <Tab.Container defaultActiveKey="branding">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent">
                <Nav variant="tabs" className="border-0">
                  <Nav.Item>
                    <Nav.Link eventKey="branding" className="d-flex align-items-center">
                      <MdPalette className="me-2" />
                      Branding
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="layout" className="d-flex align-items-center">
                      <MdBrush className="me-2" />
                      Layout
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="content" className="d-flex align-items-center">
                      <MdImage className="me-2" />
                      Content
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="advanced">Advanced</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>

              <Card.Body>
                <Tab.Content>
                  {/* Branding Tab */}
                  <Tab.Pane eventKey="branding">
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Company Logo</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleChange("logo", e.target.files[0])}
                          />
                          <Form.Text className="text-muted">Upload your company logo (PNG, JPG, SVG)</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Company Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={customization.companyName}
                            onChange={(e) => handleChange("companyName", e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Primary Color</Form.Label>
                          <Form.Control
                            type="color"
                            value={customization.primaryColor}
                            onChange={(e) => handleChange("primaryColor", e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Secondary Color</Form.Label>
                          <Form.Control
                            type="color"
                            value={customization.secondaryColor}
                            onChange={(e) => handleChange("secondaryColor", e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Background Color</Form.Label>
                          <Form.Control
                            type="color"
                            value={customization.backgroundColor}
                            onChange={(e) => handleChange("backgroundColor", e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Text Color</Form.Label>
                          <Form.Control
                            type="color"
                            value={customization.textColor}
                            onChange={(e) => handleChange("textColor", e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Theme</Form.Label>
                      <Row>
                        {themes.map((theme) => (
                          <Col key={theme.id} md={6} className="mb-3">
                            <Card
                              className={`cursor-pointer ${customization.theme === theme.id ? "border-primary" : ""}`}
                              onClick={() => handleChange("theme", theme.id)}
                            >
                              <Card.Body className="text-center">
                                <h6>{theme.name}</h6>
                                <p className="text-muted small mb-0">{theme.preview}</p>
                                <Form.Check
                                  type="radio"
                                  name="theme"
                                  checked={customization.theme === theme.id}
                                  onChange={() => handleChange("theme", theme.id)}
                                  className="mt-2"
                                />
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </Form.Group>
                  </Tab.Pane>

                  {/* Layout Tab */}
                  <Tab.Pane eventKey="layout">
                    <Form.Group className="mb-4">
                      <Form.Label>Layout Style</Form.Label>
                      <Row>
                        {layouts.map((layout) => (
                          <Col key={layout.id} md={4} className="mb-3">
                            <Card
                              className={`cursor-pointer ${customization.layout === layout.id ? "border-primary" : ""}`}
                              onClick={() => handleChange("layout", layout.id)}
                            >
                              <Card.Body className="text-center">
                                <h6>{layout.name}</h6>
                                <p className="text-muted small mb-2">{layout.description}</p>
                                <Form.Check
                                  type="radio"
                                  name="layout"
                                  checked={customization.layout === layout.id}
                                  onChange={() => handleChange("layout", layout.id)}
                                />
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="checkbox"
                            label="Show Progress Bar"
                            checked={customization.progressBar}
                            onChange={(e) => handleChange("progressBar", e.target.checked)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="checkbox"
                            label="Show Question Numbers"
                            checked={customization.questionNumbers}
                            onChange={(e) => handleChange("questionNumbers", e.target.checked)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Tab.Pane>

                  {/* Content Tab */}
                  <Tab.Pane eventKey="content">
                    <Form.Group className="mb-3">
                      <Form.Label>Welcome Message</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={customization.welcomeMessage}
                        onChange={(e) => handleChange("welcomeMessage", e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Thank You Message</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={customization.thankYouMessage}
                        onChange={(e) => handleChange("thankYouMessage", e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Footer Text</Form.Label>
                      <Form.Control
                        type="text"
                        value={customization.footerText}
                        onChange={(e) => handleChange("footerText", e.target.value)}
                      />
                    </Form.Group>
                  </Tab.Pane>

                  {/* Advanced Tab */}
                  <Tab.Pane eventKey="advanced">
                    <Form.Group className="mb-3">
                      <Form.Label>Custom CSS</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={8}
                        value={customization.customCss}
                        onChange={(e) => handleChange("customCss", e.target.value)}
                        placeholder="/* Add your custom CSS here */"
                        className="font-monospace"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Custom Domain</Form.Label>
                      <Form.Control
                        type="text"
                        value={customization.customDomain}
                        onChange={(e) => handleChange("customDomain", e.target.value)}
                        placeholder="surveys.yourcompany.com"
                      />
                      <Form.Text className="text-muted">
                        Use your own domain for surveys (requires DNS configuration)
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Form.Label className="mb-0">Embed Code</Form.Label>
                        <Button variant="outline-primary" size="sm" onClick={generateEmbedCode}>
                          Generate Code
                        </Button>
                      </div>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={customization.embedCode}
                        readOnly
                        className="font-monospace"
                        placeholder="Click 'Generate Code' to create embed code"
                      />
                      <Form.Text className="text-muted">Use this code to embed the survey on your website</Form.Text>
                    </Form.Group>
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </Col>

        {/* Preview */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header>
              <h6 className="mb-0">Live Preview</h6>
            </Card.Header>
            <Card.Body>
              <div
                className="border rounded p-3"
                style={{
                  backgroundColor: customization.backgroundColor,
                  color: customization.textColor,
                  minHeight: "400px",
                }}
              >
                {/* Header */}
                <div className="text-center mb-3">
                  {customization.logo && (
                    <div className="mb-2">
                      <div
                        className="bg-light rounded d-inline-block px-3 py-2"
                        style={{ color: customization.primaryColor }}
                      >
                        Logo
                      </div>
                    </div>
                  )}
                  <h5 style={{ color: customization.primaryColor }}>{customization.companyName}</h5>
                </div>

                {/* Welcome Message */}
                <div className="mb-3">
                  <p className="small">{customization.welcomeMessage}</p>
                </div>

                {/* Progress Bar */}
                {customization.progressBar && (
                  <div className="mb-3">
                    <div className="progress" style={{ height: "6px" }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: "60%",
                          backgroundColor: customization.primaryColor,
                        }}
                      />
                    </div>
                    <small className="text-muted">Question 3 of 5</small>
                  </div>
                )}

                {/* Sample Question */}
                <div className="mb-3">
                  {customization.questionNumbers && (
                    <span className="badge me-2" style={{ backgroundColor: customization.primaryColor }}>
                      1
                    </span>
                  )}
                  <h6>How satisfied are you with our service?</h6>
                  <div className="mt-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        className="btn btn-outline-primary btn-sm me-2 mb-2"
                        style={{
                          borderColor: customization.primaryColor,
                          color: customization.primaryColor,
                        }}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-4 pt-3 border-top">
                  <small className="text-muted">{customization.footerText}</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default SurveyCustomization
