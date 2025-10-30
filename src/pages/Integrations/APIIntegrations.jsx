// src/pages/Integrations/APIIntegrations.jsx
"use client"

import { useState } from "react"
import { MdCode, MdLink, MdSave, MdDelete } from "react-icons/md"

const APIIntegrations = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: 1,
      name: "Zapier",
      apiKey: "*****",
      connected: true,
      webhooks: [
        {
          url: "https://hooks.zapier.com/hooks/catch/123456/abc123",
          event: "new_response"
        }
      ]
    },
    {
      id: 2,
      name: "Custom API",
      apiKey: "*****",
      connected: false,
      webhooks: []
    }
  ])
  const [showForm, setShowForm] = useState(false)
  const [currentIntegration, setCurrentIntegration] = useState({
    name: '',
    apiKey: '',
    webhooks: []
  })
  const [newWebhook, setNewWebhook] = useState({
    url: '',
    event: 'new_response'
  })

  const saveIntegration = (e) => {
    e.preventDefault()
    if (currentIntegration.id) {
      setIntegrations(integrations.map(i => 
        i.id === currentIntegration.id ? currentIntegration : i
      ))
    } else {
      setIntegrations([...integrations, {
        ...currentIntegration,
        id: Date.now(),
        connected: false
      }])
    }
    setShowForm(false)
    setCurrentIntegration({ name: '', apiKey: '', webhooks: [] })
  }

  const addWebhook = () => {
    if (newWebhook.url) {
      setCurrentIntegration(prev => ({
        ...prev,
        webhooks: [...prev.webhooks, newWebhook]
      }))
      setNewWebhook({ url: '', event: 'new_response' })
    }
  }

  const removeWebhook = (index) => {
    setCurrentIntegration(prev => ({
      ...prev,
      webhooks: prev.webhooks.filter((_, i) => i !== index)
    }))
  }

  const connectIntegration = (id) => {
    setIntegrations(integrations.map(i => 
      i.id === id ? { ...i, connected: true } : i
    ))
  }

  return (
    <div className="api-integrations">
      <div className="page-header">
        <h1>
          <MdCode /> API Integrations
        </h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          New Integration
        </button>
      </div>

      {showForm && (
        <div className="integration-form">
          <h2>{currentIntegration.id ? 'Edit' : 'Add'} API Integration</h2>
          <form onSubmit={saveIntegration}>
            <div className="form-group">
              <label>Integration Name</label>
              <input
                type="text"
                value={currentIntegration.name}
                onChange={(e) => setCurrentIntegration({
                  ...currentIntegration,
                  name: e.target.value
                })}
                required
              />
            </div>
            <div className="form-group">
              <label>API Key</label>
              <input
                type="password"
                value={currentIntegration.apiKey}
                onChange={(e) => setCurrentIntegration({
                  ...currentIntegration,
                  apiKey: e.target.value
                })}
                required
              />
            </div>

            <div className="webhooks-section">
              <h3>Webhooks</h3>
              <div className="webhook-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>URL</label>
                    <input
                      type="url"
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook({
                        ...newWebhook,
                        url: e.target.value
                      })}
                      placeholder="https://example.com/webhook"
                    />
                  </div>
                  <div className="form-group">
                    <label>Event</label>
                    <select
                      value={newWebhook.event}
                      onChange={(e) => setNewWebhook({
                        ...newWebhook,
                        event: e.target.value
                      })}
                    >
                      <option value="new_response">New Response</option>
                      <option value="survey_completed">Survey Completed</option>
                      <option value="low_rating">Low Rating Received</option>
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={addWebhook}
                >
                  <MdLink /> Add Webhook
                </button>
              </div>

              <div className="webhooks-list">
                {currentIntegration.webhooks.map((webhook, index) => (
                  <div key={index} className="webhook-item">
                    <div>
                      <strong>{webhook.event}</strong>: {webhook.url}
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeWebhook(index)}
                    >
                      <MdDelete />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <MdSave /> Save Integration
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="integrations-list">
        {integrations.map(integration => (
          <div key={integration.id} className="integration-card">
            <div className="integration-header">
              <h3>{integration.name}</h3>
              <span className={`status ${integration.connected ? 'connected' : 'disconnected'}`}>
                {integration.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="integration-details">
              <p>API Key: {integration.apiKey}</p>
              {integration.webhooks.length > 0 && (
                <div className="webhooks">
                  <h4>Webhooks:</h4>
                  <ul>
                    {integration.webhooks.map((webhook, i) => (
                      <li key={i}>
                        <strong>{webhook.event}</strong>: {webhook.url}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="integration-actions">
              {!integration.connected && (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => connectIntegration(integration.id)}
                >
                  Connect
                </button>
              )}
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => {
                  setCurrentIntegration(integration)
                  setShowForm(true)
                }}
              >
                Edit
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => setIntegrations(integrations.filter(i => i.id !== integration.id))}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default APIIntegrations