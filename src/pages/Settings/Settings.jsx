// src/pages/Settings/Settings.jsx
"use client"
import {
  MdSettings,
  MdSecurity,
  MdNotifications,
  MdPalette,
  MdSave,
  MdRefresh,
  MdCheck,
  MdClose
} from "react-icons/md"
import { useEffect, useState } from "react"
import axiosInstance, { getSettings, updateSettings, resetSettings, createSettings } from "../../api/axiosInstance"


const Settings = ({ darkMode, toggleTheme }) => {
  const [activeTab, setActiveTab] = useState("general")
  const [showAlert, setShowAlert] = useState(false)
  const [settings, setSettings] = useState({
    siteName: "Rate Pro",
    siteDescription: "Professional Survey Management Platform",
    timezone: "UTC-5",
    language: "en",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    systemAlerts: true,
    darkMode: darkMode,
    primaryColor: "var(--bs-primary)",
    autoSave: true,
    sessionTimeout: "30",
  })

 useEffect(() => {
  const fetchSettings = async () => {
    try {
      const data = await getSettings()
      console.log("Fetched Settings:", data)
      setSettings(prev => ({ ...prev, ...data })) // merge defaults with fetched data
    } catch (err) {
      console.error("Failed to fetch settings:", err)
    }
  }
  fetchSettings()
}, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

const handleSave = async () => {
  try {
    const data = await createSettings(settings) // ← use create API
    setSettings(data)
    if (settings.darkMode !== darkMode) toggleTheme()
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  } catch (err) {
    console.error("Failed to create settings:", err)
  }
}

  const handleReset = async () => {
  try {
    const data = await resetSettings()
    setSettings(data)
  } catch (err) {
    console.error("Failed to reset settings:", err)
  }
}

  return (
    <div className="settings-container">
      {/* Page Header */}
      <div className="page-header-section">
        <div className="page-header-content">
          <div className="page-header-left">
            <div className="page-header-icon">
              <MdSettings />
            </div>
            <div className="page-header-text">
              <h1>Settings</h1>
              <p>Configure your application preferences and system options</p>
            </div>
          </div>
          <div className="page-header-actions">
            <button className="secondary-action" onClick={handleReset}>
              <MdRefresh />
              Reset
            </button>
            <button className="primary-action" onClick={handleSave}>
              <MdSave />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {showAlert && (
        <div className="notification-overlay" onClick={() => setShowAlert(false)}>
          <div className="notification-container success">
            <div className="notification-icon">
              <MdCheck />
            </div>
            <div className="notification-content">
              <h4>Success</h4>
              <p>Settings saved successfully!</p>
            </div>
            <button className="notification-close" onClick={() => setShowAlert(false)}>
              <MdClose />
            </button>
          </div>
        </div>
      )}

      {/* Settings Content */}
      <div className="settings-content">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <div className="tab-nav">
            <button
              className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}>
              <MdSettings />
              General
            </button>
            <button
              className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}>
              <MdNotifications />
              Notifications
            </button>
            <button
              className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}>
              <MdSecurity />
              Security
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="tab-panel active">
              <div className="section-card">
                <div className="section-header">
                  <h2>General Settings</h2>
                  <p>Configure basic application settings</p>
                </div>
                <div className="form-section">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Site Name</label>
                      <input
                        type="text"
                        name="siteName"
                        value={settings?.siteName || ""}
                        onChange={handleInputChange}
                        placeholder="Enter site name" />
                    </div>
                    <div className="form-group">
                      <label>Timezone</label>
                      <select
                        name="timezone"
                        value={settings?.timezone || "UTC+0"}
                        onChange={handleInputChange}>
                        <option value="UTC-12">UTC-12 (Baker Island)</option>
                        <option value="UTC-8">UTC-8 (Pacific Time)</option>
                        <option value="UTC-5">UTC-5 (Eastern Time)</option>
                        <option value="UTC+0">UTC+0 (Greenwich Mean Time)</option>
                        <option value="UTC+5:30">UTC+5:30 (India Standard Time)</option>
                        <option value="UTC+8">UTC+8 (China Standard Time)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Site Description</label>
                    <textarea
                      rows={3}
                      name="siteDescription"
                      value={settings?.siteDescription || ""}
                      onChange={handleInputChange}
                      placeholder="Enter site description" />
                  </div>
                  <div className="form-grid three-columns">
                    <div className="form-group">
                      <label>Language</label>
                      <select
                        name="language"
                        value={settings?.language || "en"}
                        onChange={handleInputChange}>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Date Format</label>
                      <select
                        name="dateFormat"
                        value={settings?.dateFormat || "MM/DD/YYYY"}
                        onChange={handleInputChange}>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Currency</label>
                      <select
                        name="currency"
                        value={settings.currency || "USD"}
                        onChange={handleInputChange}>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings Tab */}
          {activeTab === 'notifications' && (
            <div className="tab-panel active">
              <div className="section-card">
                <div className="section-header">
                  <h2>Notification Settings</h2>
                  <p>Configure how and when you receive notifications</p>
                </div>
                <div className="form-section">
                  <div className="settings-group">
                    <h3>Email Notifications</h3>
                    <div className="switch-group">
                      <div className="switch-item">
                        <label className="switch">
                          <input
                            type="checkbox"
                            name="emailNotifications"
                            checked={settings?.emailNotifications || false }
                            onChange={handleInputChange} />
                          <span className="switch-slider">
                            <span className="switch-label">Enable Email Notifications</span>
                          </span>
                        </label>
                      </div>
                      <div className="switch-item">
                        <label className="switch">
                          <input
                            type="checkbox"
                            name="weeklyReports"
                            checked={settings?.weeklyReports || false }
                            onChange={handleInputChange} />
                          <span className="switch-slider">
                            <span className="switch-label">Weekly Reports</span>
                          </span>
                        </label>
                      </div>
                      <div className="switch-item">
                        <label className="switch">
                          <input
                            type="checkbox"
                            name="systemAlerts"
                            checked={settings?.systemAlerts || false }
                            onChange={handleInputChange} />
                          <span className="switch-slider">
                            <span className="switch-label">System Alerts</span>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="settings-group">
                    <h3>Push Notifications</h3>
                    <div className="switch-group">
                      <div className="switch-item">
                        <label className="switch">
                          <input
                            type="checkbox"
                            name="pushNotifications"
                            checked={settings?.pushNotifications || false }
                            onChange={handleInputChange} />
                          <span className="switch-slider">
                            <span className="switch-label">Enable Push Notifications</span>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings Tab */}
          {activeTab === 'security' && (
            <div className="tab-panel active">
              <div className="section-card">
                <div className="section-header">
                  <h2>Security Settings</h2>
                  <p>Manage security and privacy options</p>
                </div>
                <div className="form-section">
                  <div className="form-group">
                    <label>Session Timeout</label>
                    <select
                      name="sessionTimeout"
                      value={settings?.sessionTimeout || "30"}
                      onChange={handleInputChange} >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="0">Never</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <div className="switch-container">
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="autoSave"
                          checked={settings?.autoSave || false}
                          onChange={handleInputChange} />
                        <span className="switch-slider">
                          <span className="switch-label">Auto-save changes</span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings