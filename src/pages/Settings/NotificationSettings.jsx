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
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--primary-light)] text-[var(--primary-color)]">
              <MdNotifications className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Notification Settings</h1>
              <p className="text-sm text-[var(--text-secondary)]">Configure how and when you receive notifications across all channels</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-hover)] hover:bg-opacity-10 dark:hover:bg-[var(--dark-hover)] dark:hover:bg-opacity-10 flex items-center gap-2">
              <MdRefresh />
              Reset to Defaults
            </button>
            <button className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center gap-2" onClick={handleSave}>
              <MdSave />
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {saved && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSaved(false)}>
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-lg shadow-lg p-6 max-w-md w-full flex items-start gap-4 border-l-4 border-[var(--success-color)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--success-light)] text-[var(--success-color)]">
              <MdCheckCircle className="text-2xl" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Settings Saved</h4>
              <p className="text-sm text-[var(--text-secondary)]">Your notification preferences have been updated successfully!</p>
            </div>
            <button className="text-[var(--text-secondary)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)] transition-colors" onClick={() => setSaved(false)}>
              <MdClose className="text-xl" />
            </button>
          </div>
        </div>
      )}

      {/* Notification Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Notifications */}
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-lg shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdEmail className="text-2xl text-[var(--primary-color)]" />
              <div>
                <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Email Notifications</h2>
                <p className="text-sm text-[var(--text-secondary)]">Receive notifications via email</p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-[var(--success-light)] text-[var(--success-color)] text-sm font-medium flex items-center gap-1">
              <MdCheck />
              Active
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.email.newResponses}
                    onChange={(e) => updateEmailSetting("newResponses", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                </label>
                <div className="flex-1">
                  <span className="block font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">New survey responses</span>
                  <span className="block text-sm text-[var(--text-secondary)]">Get notified when someone completes your survey</span>
                </div>
              </div>
              
              <div className="flex items-start justify-between gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.email.surveyCompleted}
                    onChange={(e) => updateEmailSetting("surveyCompleted", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                </label>
                <div className="flex-1">
                  <span className="block font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Survey completion milestones</span>
                  <span className="block text-sm text-[var(--text-secondary)]">Notifications for response milestones (100, 500, 1000+)</span>
                </div>
              </div>
              
              <div className="flex items-start justify-between gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.email.weeklyReports}
                    onChange={(e) => updateEmailSetting("weeklyReports", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                </label>
                <div className="flex-1">
                  <span className="block font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Weekly summary reports</span>
                  <span className="block text-sm text-[var(--text-secondary)]">Weekly digest of your survey performance</span>
                </div>
              </div>
              
              <div className="flex items-start justify-between gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.email.systemUpdates}
                    onChange={(e) => updateEmailSetting("systemUpdates", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                </label>
                <div className="flex-1">
                  <span className="block font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">System updates and maintenance</span>
                  <span className="block text-sm text-[var(--text-secondary)]">Important system announcements and scheduled maintenance</span>
                </div>
              </div>
              
              <div className="flex items-start justify-between gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.email.securityAlerts}
                    onChange={(e) => updateEmailSetting("securityAlerts", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                </label>
                <div className="flex-1">
                  <span className="block font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Security alerts</span>
                  <span className="block text-sm text-[var(--text-secondary)]">Login attempts and security-related notifications</span>
                </div>
              </div>
              
              <div className="flex items-start justify-between gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.email.marketingEmails}
                    onChange={(e) => updateEmailSetting("marketingEmails", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                </label>
                <div className="flex-1">
                  <span className="block font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Marketing emails</span>
                  <span className="block text-sm text-[var(--text-secondary)]">Product updates, tips, and promotional content</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-lg shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdPhoneAndroid className="text-2xl text-[var(--primary-color)]" />
              <div>
                <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Push Notifications</h2>
                <p className="text-sm text-[var(--text-secondary)]">Browser and mobile push notifications</p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-[var(--light-border)] dark:bg-[var(--dark-border)] text-[var(--text-secondary)] text-sm font-medium">
              Browser Only
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.push.newResponses}
                    onChange={(e) => updatePushSetting("newResponses", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                </label>
                <div className="flex-1">
                  <span className="block font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">New responses</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.push.surveyCompleted}
                    onChange={(e) => updatePushSetting("surveyCompleted", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                </label>
                <div className="flex-1">
                  <span className="block font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Survey milestones</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.push.systemAlerts}
                    onChange={(e) => updatePushSetting("systemAlerts", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                </label>
                <div className="flex-1">
                  <span className="block font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">System alerts</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.push.reminders}
                    onChange={(e) => updatePushSetting("reminders", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                </label>
                <div className="flex-1">
                  <span className="block font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Task reminders</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 rounded-lg bg-[var(--info-light)] border border-[var(--info-color)] border-opacity-20 flex items-start gap-3">
              <MdInfo className="text-xl text-[var(--info-color)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">Push notifications require browser permission. Click "Allow" when prompted to enable notifications.</p>
            </div>
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-lg shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdSms className="text-2xl text-[var(--primary-color)]" />
              <div>
                <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">SMS Notifications</h2>
                <p className="text-sm text-[var(--text-secondary)]">Text message notifications to your phone</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${settings.sms.enabled ? 'bg-[var(--success-light)] text-[var(--success-color)]' : 'bg-[var(--light-border)] dark:bg-[var(--dark-border)] text-[var(--text-secondary)]'}`}>
              {settings.sms.enabled ? 'Active' : 'Disabled'}
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.sms.enabled}
                    onChange={(e) => updateSmsSetting("enabled", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                </label>
                <div className="flex-1">
                  <span className="block font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Enable SMS notifications</span>
                </div>
              </div>
            </div>

            {settings.sms.enabled && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={settings.sms.phoneNumber}
                    onChange={(e) => updateSmsSetting("phoneNumber", e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  />
                  <span className="block mt-1 text-xs text-[var(--text-secondary)]">Include country code</span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.sms.criticalAlerts}
                      onChange={(e) => updateSmsSetting("criticalAlerts", e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                  </label>
                  <div className="flex-1">
                    <span className="block font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Critical alerts only</span>
                    <span className="block text-sm text-[var(--text-secondary)]">Security issues and system outages</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[var(--warning-light)] border border-[var(--warning-color)] border-opacity-20 flex items-start gap-3">
                  <MdWarning className="text-xl text-[var(--warning-color)] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">SMS notifications may incur charges based on your mobile plan.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Slack Integration */}
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-lg shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaSlack className="text-2xl text-[var(--primary-color)]" />
              <div>
                <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Slack Integration</h2>
                <p className="text-sm text-[var(--text-secondary)]">Send notifications to Slack channels</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${settings.slack.enabled ? 'bg-[var(--success-light)] text-[var(--success-color)]' : 'bg-[var(--light-border)] dark:bg-[var(--dark-border)] text-[var(--text-secondary)]'}`}>
              {settings.slack.enabled ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.slack.enabled}
                    onChange={(e) => updateSlackSetting("enabled", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                </label>
                <div className="flex-1">
                  <span className="block font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Enable Slack notifications</span>
                </div>
              </div>
            </div>

            {settings.slack.enabled && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Webhook URL</label>
                  <input
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    value={settings.slack.webhook}
                    onChange={(e) => updateSlackSetting("webhook", e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Channel</label>
                  <input
                    type="text"
                    placeholder="#surveys"
                    value={settings.slack.channel}
                    onChange={(e) => updateSlackSetting("channel", e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.slack.newResponses}
                        onChange={(e) => updateSlackSetting("newResponses", e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                    </label>
                    <div className="flex-1">
                      <span className="block font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">New responses</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.slack.surveyCompleted}
                        onChange={(e) => updateSlackSetting("surveyCompleted", e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                    </label>
                    <div className="flex-1">
                      <span className="block font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Survey milestones</span>
                    </div>
                  </div>
                </div>

                <button className="w-full px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] flex items-center justify-center gap-2">
                  <MdCheck />
                  Test Slack Connection
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notification Schedule */}
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-lg shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdSchedule className="text-2xl text-[var(--primary-color)]" />
              <div>
                <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Notification Schedule</h2>
                <p className="text-sm text-[var(--text-secondary)]">Configure quiet hours and timing preferences</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-3">Quiet Hours</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="time"
                      defaultValue="22:00"
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    />
                    <span className="block mt-1 text-xs text-[var(--text-secondary)]">From</span>
                  </div>
                  <div>
                    <input
                      type="time"
                      defaultValue="08:00"
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    />
                    <span className="block mt-1 text-xs text-[var(--text-secondary)]">To</span>
                  </div>
                </div>
                <span className="block mt-2 text-xs text-[var(--text-secondary)]">No notifications during these hours</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Timezone</label>
                <select
                  defaultValue="UTC"
                  className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="GMT">Greenwich Mean Time</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                </label>
                <div className="flex-1">
                  <span className="block font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Disable weekend notifications</span>
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
