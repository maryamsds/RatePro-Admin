// src/pages/Communication/SMSSettings.jsx
"use client"

import { useState, useEffect } from "react"
import { MdSms, MdSave, MdSettings } from "react-icons/md"
import axiosInstance from "../../api/axiosInstance"

const SMSSettings = () => {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    provider: 'twilio',
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
        to: '+1234567890',
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
    <div className="w-full p-6">
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
            <MdSms className="text-2xl text-blue-500" />
          </div>
          <h5 className="text-xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">SMS Integration Settings</h5>
        </div>

        {message.text && (
          <div className={`p-4 rounded-md border mb-6 ${message.type === 'success' ? 'bg-green-50 dark:bg-green-500/10 border-[var(--success-color)] text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-500/10 border-[var(--danger-color)] text-red-700 dark:text-red-400'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">SMS Provider</label>
              <select
                name="provider"
                value={settings.provider}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              >
                <option value="twilio">Twilio</option>
                <option value="aws-sns">AWS SNS</option>
                <option value="nexmo">Vonage (Nexmo)</option>
                <option value="messagebird">MessageBird</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">From Number</label>
              <input
                type="text"
                name="fromNumber"
                value={settings.fromNumber}
                onChange={handleInputChange}
                placeholder="+1234567890"
                required
                className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Account SID / API Key</label>
              <input
                type="text"
                name="accountSid"
                value={settings.accountSid}
                onChange={handleInputChange}
                placeholder="Enter your account SID or API key"
                required
                className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Auth Token / API Secret</label>
              <input
                type="password"
                name="authToken"
                value={settings.authToken}
                onChange={handleInputChange}
                placeholder="Enter your auth token or API secret"
                required
                className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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
              <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">Enable SMS Integration</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] inline-flex items-center gap-2 disabled:opacity-50"
            >
              <MdSave />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>

            <button
              type="button"
              onClick={testSMS}
              disabled={loading || !settings.isEnabled}
              className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] inline-flex items-center gap-2 disabled:opacity-50"
            >
              <MdSms />
              Send Test SMS
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SMSSettings