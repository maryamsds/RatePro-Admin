// src/pages/Communication/WhatsAppSettings.jsx
"use client"

import { useState, useEffect } from "react"
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
        fetchSettings()
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

  if (loading && !settings.accessToken) {
    return (
      <div className="w-full p-4">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full p-4">
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="flex items-center gap-3 p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
            <IoLogoWhatsapp className="text-2xl text-green-500" />
          </div>
          <h5 className="text-lg font-semibold m-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">WhatsApp Integration Settings</h5>
        </div>
        <div className="p-6">
          {message.text && (
            <div className={`p-4 rounded-md border mb-6 ${message.type === 'success' ? 'bg-[var(--success-light)] border-[var(--success-color)] text-green-700 dark:text-green-400' : 'bg-[var(--danger-light)] border-[var(--danger-color)] text-red-700 dark:text-red-400'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Access Token</label>
                <input
                  type="password"
                  name="accessToken"
                  value={settings.accessToken}
                  onChange={handleInputChange}
                  placeholder="Enter WhatsApp Business API access token"
                  required
                  className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Phone Number ID</label>
                <input
                  type="text"
                  name="phoneNumberId"
                  value={settings.phoneNumberId}
                  onChange={handleInputChange}
                  placeholder="Enter phone number ID"
                  required
                  className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Webhook Verify Token</label>
                <input
                  type="text"
                  name="webhookVerifyToken"
                  value={settings.webhookVerifyToken}
                  onChange={handleInputChange}
                  placeholder="Enter webhook verification token"
                  required
                  className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Business Account ID</label>
                <input
                  type="text"
                  name="businessAccountId"
                  value={settings.businessAccountId}
                  onChange={handleInputChange}
                  placeholder="Enter business account ID"
                  required
                  className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">App ID</label>
                <input
                  type="text"
                  name="appId"
                  value={settings.appId}
                  onChange={handleInputChange}
                  placeholder="Enter Facebook app ID"
                  required
                  className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">App Secret</label>
                <input
                  type="password"
                  name="appSecret"
                  value={settings.appSecret}
                  onChange={handleInputChange}
                  placeholder="Enter Facebook app secret"
                  required
                  className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                />
              </div>
            </div>

            <div className="mt-6 mb-6">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isEnabled"
                  checked={settings.isEnabled}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]"
                />
                <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Enable WhatsApp Integration</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] transition-colors font-medium inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdSave />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default WhatsAppSettings