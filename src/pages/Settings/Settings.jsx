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
    <div className="min-h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--primary-light)] text-[var(--primary-color)] text-2xl flex-shrink-0">
                <MdSettings />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Settings</h1>
                <p className="text-sm text-[var(--text-secondary)]">Configure your application preferences and system options</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]"
                onClick={handleReset}
              >
                <MdRefresh className="text-lg" />
                Reset
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]"
                onClick={handleSave}
              >
                <MdSave className="text-lg" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Success Notification */}
        {showAlert && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAlert(false)}>
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg p-6 max-w-md w-full border border-[var(--light-border)] dark:border-[var(--dark-border)] animate-fadeIn" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--success-light)] text-[var(--success-color)] flex-shrink-0">
                  <MdCheck className="text-2xl" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Success</h4>
                  <p className="text-sm text-[var(--text-secondary)]">Settings saved successfully!</p>
                </div>
                <button 
                  className="flex items-center justify-center w-8 h-8 rounded-md text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors"
                  onClick={() => setShowAlert(false)}
                >
                  <MdClose className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Content */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <button
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'general'
                  ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)]'
              }`}
              onClick={() => setActiveTab('general')}
            >
              <MdSettings className="text-lg" />
              General
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)]'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              <MdNotifications className="text-lg" />
              Notifications
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)]'
              }`}
              onClick={() => setActiveTab('security')}
            >
              <MdSecurity className="text-lg" />
              Security
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">General Settings</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Configure basic application settings</p>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        name="siteName"
                        value={settings?.siteName || ""}
                        onChange={handleInputChange}
                        placeholder="Enter site name"
                        className="w-full px-4 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                        Timezone
                      </label>
                      <select
                        name="timezone"
                        value={settings?.timezone || "UTC+0"}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                      >
                        <option value="UTC-12">UTC-12 (Baker Island)</option>
                        <option value="UTC-8">UTC-8 (Pacific Time)</option>
                        <option value="UTC-5">UTC-5 (Eastern Time)</option>
                        <option value="UTC+0">UTC+0 (Greenwich Mean Time)</option>
                        <option value="UTC+5:30">UTC+5:30 (India Standard Time)</option>
                        <option value="UTC+8">UTC+8 (China Standard Time)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                      Site Description
                    </label>
                    <textarea
                      rows={3}
                      name="siteDescription"
                      value={settings?.siteDescription || ""}
                      onChange={handleInputChange}
                      placeholder="Enter site description"
                      className="w-full px-4 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                        Language
                      </label>
                      <select
                        name="language"
                        value={settings?.language || "en"}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                        Date Format
                      </label>
                      <select
                        name="dateFormat"
                        value={settings?.dateFormat || "MM/DD/YYYY"}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={settings.currency || "USD"}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Notification Settings</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Configure how and when you receive notifications</p>
                </div>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            name="emailNotifications"
                            checked={settings?.emailNotifications || false}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[var(--light-border)] dark:bg-[var(--dark-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:bg-[var(--primary-color)] transition-colors"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                        </div>
                        <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] group-hover:text-[var(--primary-color)] transition-colors">
                          Enable Email Notifications
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            name="weeklyReports"
                            checked={settings?.weeklyReports || false}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[var(--light-border)] dark:bg-[var(--dark-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:bg-[var(--primary-color)] transition-colors"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                        </div>
                        <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] group-hover:text-[var(--primary-color)] transition-colors">
                          Weekly Reports
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            name="systemAlerts"
                            checked={settings?.systemAlerts || false}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[var(--light-border)] dark:bg-[var(--dark-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:bg-[var(--primary-color)] transition-colors"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                        </div>
                        <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] group-hover:text-[var(--primary-color)] transition-colors">
                          System Alerts
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-4">Push Notifications</h3>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            name="pushNotifications"
                            checked={settings?.pushNotifications || false}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[var(--light-border)] dark:bg-[var(--dark-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:bg-[var(--primary-color)] transition-colors"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                        </div>
                        <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] group-hover:text-[var(--primary-color)] transition-colors">
                          Enable Push Notifications
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings Tab */}
            {activeTab === 'security' && (
              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Security Settings</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Manage security and privacy options</p>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                      Session Timeout
                    </label>
                    <select
                      name="sessionTimeout"
                      value={settings?.sessionTimeout || "30"}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="0">Never</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="autoSave"
                          checked={settings?.autoSave || false}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[var(--light-border)] dark:bg-[var(--dark-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:bg-[var(--primary-color)] transition-colors"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                      </div>
                      <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] group-hover:text-[var(--primary-color)] transition-colors">
                        Auto-save changes
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings