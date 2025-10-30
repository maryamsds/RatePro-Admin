// src/pages/Communication/SMSSettings.jsx
"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap"
import { MdSms, MdSave, MdSettings } from "react-icons/md"
import axiosInstance from "../../api/axiosInstance"

const SMSSettings = () => {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    provider: 'twilio', // twilio, aws-sns, etc.
    accountSid: '',
    authToken: '',
    fromNumber: '',
    isEnabled: false
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      // This would call your SMS settings endpoint
      // const response = await axiosInstance.get('/api/sms/settings')
      // if (response.data.success) {
      //   setSettings(response.data.data || settings)
      // }
    } catch (error) {
      console.error('Error fetching SMS settings:', error)
      setMessage({ type: 'error', text: 'Failed to load SMS settings' })
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

      // This would call your SMS settings save endpoint
      const response = await axiosInstance.post('/api/sms/settings', settings)
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'SMS settings saved successfully!' })
        fetchSettings()
      }
    } catch (error) {
      console.error('Error saving SMS settings:', error)
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save SMS settings' 
      })
    } finally {
      setLoading(false)
    }
  }

  const testSMS = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.post('/api/sms/test', {
        to: '+1234567890', // Test number
        message: 'Test SMS from RatePro'
      })
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Test SMS sent successfully!' })
      }
    } catch (error) {
      console.error('Error sending test SMS:', error)
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to send test SMS' 
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
              <MdSms className="me-2 text-primary" size={24} />
              <h5 className="mb-0">SMS Integration Settings</h5>
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
                      <Form.Label>SMS Provider</Form.Label>
                      <Form.Select
                        name="provider"
                        value={settings.provider}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="twilio">Twilio</option>
                        <option value="aws-sns">AWS SNS</option>
                        <option value="nexmo">Vonage (Nexmo)</option>
                        <option value="messagebird">MessageBird</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>From Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="fromNumber"
                        value={settings.fromNumber}
                        onChange={handleInputChange}
                        placeholder="+1234567890"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Account SID / API Key</Form.Label>
                      <Form.Control
                        type="text"
                        name="accountSid"
                        value={settings.accountSid}
                        onChange={handleInputChange}
                        placeholder="Enter your account SID or API key"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Auth Token / API Secret</Form.Label>
                      <Form.Control
                        type="password"
                        name="authToken"
                        value={settings.authToken}
                        onChange={handleInputChange}
                        placeholder="Enter your auth token or API secret"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Check
                    type="checkbox"
                    name="isEnabled"
                    label="Enable SMS Integration"
                    checked={settings.isEnabled}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="d-flex align-items-center"
                  >
                    <MdSave className="me-2" />
                    {loading ? 'Saving...' : 'Save Settings'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={testSMS}
                    disabled={loading || !settings.isEnabled}
                    className="d-flex align-items-center"
                  >
                    <MdSms className="me-2" />
                    Send Test SMS
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default SMSSettings