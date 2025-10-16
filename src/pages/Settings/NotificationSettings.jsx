// src\pages\Settings\NotificationSettings.jsx

"use client"

import { useState } from "react"
import {
  MdNotifications,
  MdEmail,
  MdPhoneAndroid,
  MdSms,
  MdSchedule,
  MdSave,
  MdRefresh,
  MdCheck,
  MdClose,
  MdInfo,
  MdWarning,
  MdCheckCircle
} from "react-icons/md"
import { FaSlack } from "react-icons/fa";


const NotificationSettings = () => {
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    email: {
      newResponses: true,
      surveyCompleted: true,
      weeklyReports: true,
      systemUpdates: false,
      marketingEmails: false,
      securityAlerts: true,
    },
    push: {
      newResponses: false,
      surveyCompleted: true,
      systemAlerts: true,
      reminders: true,
    },
    sms: {
      enabled: false,
      criticalAlerts: false,
      phoneNumber: "",
    },
    slack: {
      enabled: true,
      webhook: "https://hooks.slack.com/...",
      channel: "#surveys",
      newResponses: true,
      surveyCompleted: true,
    },
  })

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const updateEmailSetting = (key, value) => {
    setSettings({
      ...settings,
      email: { ...settings.email, [key]: value },
    })
  }

  const updatePushSetting = (key, value) => {
    setSettings({
      ...settings,
      push: { ...settings.push, [key]: value },
    })
  }

  const updateSmsSetting = (key, value) => {
    setSettings({
      ...settings,
      sms: { ...settings.sms, [key]: value },
    })
  }

  const updateSlackSetting = (key, value) => {
    setSettings({
      ...settings,
      slack: { ...settings.slack, [key]: value },
    })
  }

  return (
    <div className="notification-settings-container">
      {/* Page Header */}
      <div className="page-header-section">
        <div className="page-header-content">
          <div className="page-header-left">
            <div className="page-header-icon">
              <MdNotifications />
            </div>
            <div className="page-header-text">
              <h1>Notification Settings</h1>
              <p>Configure how and when you receive notifications across all channels</p>
            </div>
          </div>
          <div className="page-header-actions">
            <button className="secondary-action">
              <MdRefresh />
              Reset to Defaults
            </button>
            <button className="primary-action" onClick={handleSave}>
              <MdSave />
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {saved && (
        <div className="notification-overlay" onClick={() => setSaved(false)}>
          <div className="notification-container success">
            <div className="notification-icon">
              <MdCheckCircle />
            </div>
            <div className="notification-content">
              <h4>Settings Saved</h4>
              <p>Your notification preferences have been updated successfully!</p>
            </div>
            <button className="notification-close" onClick={() => setSaved(false)}>
              <MdClose />
            </button>
          </div>
        </div>
      )}

      {/* Notification Content */}
      <div className="notification-content">
        <div className="notification-grid">
          {/* Email Notifications */}
          <div className="notification-section">
            <div className="section-card">
              <div className="section-header">
                <div className="section-title">
                  <MdEmail className="section-icon" />
                  <div>
                    <h2>Email Notifications</h2>
                    <p>Receive notifications via email</p>
                  </div>
                </div>
                <div className="status-badge active">
                  <MdCheck />
                  Active
                </div>
              </div>
              <div className="section-content">
                <div className="switch-group">
                  <div className="switch-item">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.email.newResponses}
                        onChange={(e) => updateEmailSetting("newResponses", e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                      <div className="switch-content">
                        <span className="switch-label">New survey responses</span>
                        <span className="switch-description">Get notified when someone completes your survey</span>
                      </div>
                    </label>
                  </div>
                  
                  <div className="switch-item">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.email.surveyCompleted}
                        onChange={(e) => updateEmailSetting("surveyCompleted", e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                      <div className="switch-content">
                        <span className="switch-label">Survey completion milestones</span>
                        <span className="switch-description">Notifications for response milestones (100, 500, 1000+)</span>
                      </div>
                    </label>
                  </div>
                  
                  <div className="switch-item">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.email.weeklyReports}
                        onChange={(e) => updateEmailSetting("weeklyReports", e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                      <div className="switch-content">
                        <span className="switch-label">Weekly summary reports</span>
                        <span className="switch-description">Weekly digest of your survey performance</span>
                      </div>
                    </label>
                  </div>
                  
                  <div className="switch-item">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.email.systemUpdates}
                        onChange={(e) => updateEmailSetting("systemUpdates", e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                      <div className="switch-content">
                        <span className="switch-label">System updates and maintenance</span>
                        <span className="switch-description">Important system announcements and scheduled maintenance</span>
                      </div>
                    </label>
                  </div>
                  
                  <div className="switch-item">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.email.securityAlerts}
                        onChange={(e) => updateEmailSetting("securityAlerts", e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                      <div className="switch-content">
                        <span className="switch-label">Security alerts</span>
                        <span className="switch-description">Login attempts and security-related notifications</span>
                      </div>
                    </label>
                  </div>
                  
                  <div className="switch-item">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.email.marketingEmails}
                        onChange={(e) => updateEmailSetting("marketingEmails", e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                      <div className="switch-content">
                        <span className="switch-label">Marketing emails</span>
                        <span className="switch-description">Product updates, tips, and promotional content</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Push Notifications */}
          <div className="notification-section">
            <div className="section-card">
              <div className="section-header">
                <div className="section-title">
                  <MdPhoneAndroid className="section-icon" />
                  <div>
                    <h2>Push Notifications</h2>
                    <p>Browser and mobile push notifications</p>
                  </div>
                </div>
                <div className="status-badge secondary">
                  Browser Only
                </div>
              </div>
              <div className="section-content">
                <div className="switch-group">
                  <div className="switch-item">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.push.newResponses}
                        onChange={(e) => updatePushSetting("newResponses", e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                      <div className="switch-content">
                        <span className="switch-label">New responses</span>
                      </div>
                    </label>
                  </div>
                  
                  <div className="switch-item">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.push.surveyCompleted}
                        onChange={(e) => updatePushSetting("surveyCompleted", e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                      <div className="switch-content">
                        <span className="switch-label">Survey milestones</span>
                      </div>
                    </label>
                  </div>
                  
                  <div className="switch-item">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.push.systemAlerts}
                        onChange={(e) => updatePushSetting("systemAlerts", e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                      <div className="switch-content">
                        <span className="switch-label">System alerts</span>
                      </div>
                    </label>
                  </div>
                  
                  <div className="switch-item">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.push.reminders}
                        onChange={(e) => updatePushSetting("reminders", e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                      <div className="switch-content">
                        <span className="switch-label">Task reminders</span>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="info-alert">
                  <MdInfo className="info-icon" />
                  <p>Push notifications require browser permission. Click "Allow" when prompted to enable notifications.</p>
                </div>
              </div>
            </div>
          </div>
          {/* SMS Notifications */}
          <div className="notification-section">
            <div className="section-card">
              <div className="section-header">
                <div className="section-title">
                  <MdSms className="section-icon" />
                  <div>
                    <h2>SMS Notifications</h2>
                    <p>Text message notifications to your phone</p>
                  </div>
                </div>
                <div className={`status-badge ${settings.sms.enabled ? 'active' : 'inactive'}`}>
                  {settings.sms.enabled ? 'Active' : 'Disabled'}
                </div>
              </div>
              <div className="section-content">
                <div className="switch-group">
                  <div className="switch-item">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.sms.enabled}
                        onChange={(e) => updateSmsSetting("enabled", e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                      <div className="switch-content">
                        <span className="switch-label">Enable SMS notifications</span>
                      </div>
                    </label>
                  </div>
                </div>

                {settings.sms.enabled && (
                  <div className="form-section">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={settings.sms.phoneNumber}
                        onChange={(e) => updateSmsSetting("phoneNumber", e.target.value)}
                      />
                      <span className="form-help">Include country code</span>
                    </div>

                    <div className="switch-group">
                      <div className="switch-item">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={settings.sms.criticalAlerts}
                            onChange={(e) => updateSmsSetting("criticalAlerts", e.target.checked)}
                          />
                          <span className="switch-slider"></span>
                          <div className="switch-content">
                            <span className="switch-label">Critical alerts only</span>
                            <span className="switch-description">Security issues and system outages</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="warning-alert">
                      <MdWarning className="warning-icon" />
                      <p>SMS notifications may incur charges based on your mobile plan.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Slack Integration */}
          <div className="notification-section">
            <div className="section-card">
              <div className="section-header">
                <div className="section-title">
                  <FaSlack className="section-icon" />
                  <div>
                    <h2>Slack Integration</h2>
                    <p>Send notifications to Slack channels</p>
                  </div>
                </div>
                <div className={`status-badge ${settings.slack.enabled ? 'active' : 'inactive'}`}>
                  {settings.slack.enabled ? 'Connected' : 'Disconnected'}
                </div>
              </div>
              <div className="section-content">
                <div className="switch-group">
                  <div className="switch-item">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.slack.enabled}
                        onChange={(e) => updateSlackSetting("enabled", e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                      <div className="switch-content">
                        <span className="switch-label">Enable Slack notifications</span>
                      </div>
                    </label>
                  </div>
                </div>

                {settings.slack.enabled && (
                  <div className="form-section">
                    <div className="form-group">
                      <label>Webhook URL</label>
                      <input
                        type="url"
                        placeholder="https://hooks.slack.com/services/..."
                        value={settings.slack.webhook}
                        onChange={(e) => updateSlackSetting("webhook", e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Channel</label>
                      <input
                        type="text"
                        placeholder="#surveys"
                        value={settings.slack.channel}
                        onChange={(e) => updateSlackSetting("channel", e.target.value)}
                      />
                    </div>

                    <div className="switch-group">
                      <div className="switch-item">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={settings.slack.newResponses}
                            onChange={(e) => updateSlackSetting("newResponses", e.target.checked)}
                          />
                          <span className="switch-slider"></span>
                          <div className="switch-content">
                            <span className="switch-label">New responses</span>
                          </div>
                        </label>
                      </div>

                      <div className="switch-item">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={settings.slack.surveyCompleted}
                            onChange={(e) => updateSlackSetting("surveyCompleted", e.target.checked)}
                          />
                          <span className="switch-slider"></span>
                          <div className="switch-content">
                            <span className="switch-label">Survey milestones</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button className="test-button">
                      <MdCheck />
                      Test Slack Connection
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notification Schedule */}
          <div className="notification-section">
            <div className="section-card">
              <div className="section-header">
                <div className="section-title">
                  <MdSchedule className="section-icon" />
                  <div>
                    <h2>Notification Schedule</h2>
                    <p>Configure quiet hours and timing preferences</p>
                  </div>
                </div>
              </div>
              <div className="section-content">
                <div className="form-section">
                  <div className="form-group">
                    <label>Quiet Hours</label>
                    <div className="time-range">
                      <div className="time-input">
                        <input type="time" defaultValue="22:00" />
                        <span className="time-label">From</span>
                      </div>
                      <div className="time-input">
                        <input type="time" defaultValue="08:00" />
                        <span className="time-label">To</span>
                      </div>
                    </div>
                    <span className="form-help">No notifications during these hours</span>
                  </div>

                  <div className="form-group">
                    <label>Timezone</label>
                    <select defaultValue="UTC">
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="GMT">Greenwich Mean Time</option>
                    </select>
                  </div>

                  <div className="switch-group">
                    <div className="switch-item">
                      <label className="switch">
                        <input type="checkbox" />
                        <span className="switch-slider"></span>
                        <div className="switch-content">
                          <span className="switch-label">Disable weekend notifications</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationSettings
