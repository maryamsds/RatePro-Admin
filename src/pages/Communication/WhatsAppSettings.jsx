// src/pages/Communication/WhatsAppSettings.jsx
"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap"
import { MdSave, MdSettings } from "react-icons/md"
import { IoLogoWhatsapp } from "react-icons/io5";
import axiosInstance from "../../api/axiosInstance"

const WhatsAppSettings = () => {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    accessToken: '',
    phoneNumberId: '',
    webhookVerifyToken: '',
    businessAccountId: '',
    appId: '',
    appSecret: '',
    isEnabled: false
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/api/whatsapp')
      if (response.data.success) {
        setSettings(response.data.data || settings)
      }
    } catch (error) {
      console.error('Error fetching WhatsApp settings:', error)
      setMessage({ type: 'error', text: 'Failed to load WhatsApp settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setMessage({ type: '', text: '' })

      const response = await axiosInstance.post('/api/whatsapp', settings)
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'WhatsApp settings saved successfully!' })
        fetchSettings() // Refresh settings
      }
    } catch (error) {
      console.error('Error saving WhatsApp settings:', error)
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save WhatsApp settings' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex align-items-center">
              <IoLogoWhatsapp  className="me-2 text-success" size={24} />
              <h5 className="mb-0">WhatsApp Integration Settings</h5>
            </Card.Header>
            <Card.Body>
              {message.text && (
                <Alert variant={message.type === 'success' ? 'success' : 'danger'}>
                  {message.text}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Access Token</Form.Label>
                      <Form.Control
                        type="password"
                        name="accessToken"
                        value={settings.accessToken}
                        onChange={handleInputChange}
                        placeholder="Enter WhatsApp Business API access token"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="phoneNumberId"
                        value={settings.phoneNumberId}
                        onChange={handleInputChange}
                        placeholder="Enter phone number ID"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Webhook Verify Token</Form.Label>
                      <Form.Control
                        type="text"
                        name="webhookVerifyToken"
                        value={settings.webhookVerifyToken}
                        onChange={handleInputChange}
                        placeholder="Enter webhook verification token"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Business Account ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="businessAccountId"
                        value={settings.businessAccountId}
                        onChange={handleInputChange}
                        placeholder="Enter business account ID"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>App ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="appId"
                        value={settings.appId}
                        onChange={handleInputChange}
                        placeholder="Enter Facebook app ID"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>App Secret</Form.Label>
                      <Form.Control
                        type="password"
                        name="appSecret"
                        value={settings.appSecret}
                        onChange={handleInputChange}
                        placeholder="Enter Facebook app secret"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Check
                    type="checkbox"
                    name="isEnabled"
                    label="Enable WhatsApp Integration"
                    checked={settings.isEnabled}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="d-flex align-items-center"
                >
                  <MdSave className="me-2" />
                  {loading ? 'Saving...' : 'Save Settings'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default WhatsAppSettings