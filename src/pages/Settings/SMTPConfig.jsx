// src\pages\Settings\SMTPConfig.jsx
"use client"

import { useState } from "react"
import { MdSave, MdSend, MdEmail, MdSettings, MdInfo } from "react-icons/md"

const SMTPConfig = ({ darkMode }) => {
  const [config, setConfig] = useState({
    host: "",
    port: 587,
    username: "",
    password: "",
    fromEmail: "",
    fromName: "",
  })
  const [testEmail, setTestEmail] = useState("")
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setConfig((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    console.log("SMTP config saved:", config)
  }

  const handleTest = async (e) => {
    e.preventDefault()
    setIsTesting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setTestResult({
        success: true,
        message: "Test email sent successfully!",
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: "Failed to send test email: " + error.message,
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="w-full py-4 px-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center">
          <MdEmail size={32} className="text-[var(--primary-color)] mr-3" />
          <div>
            <h2 className="text-2xl font-bold mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">SMTP Configuration</h2>
            <p className="text-[var(--text-secondary)] mb-0">Configure email server settings for sending notifications</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          {/* SMTP Settings Card */}
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] mb-4">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <MdSettings className="text-[var(--primary-color)]" size={20} />
              <h5 className="font-semibold m-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">SMTP Server Settings</h5>
            </div>
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">SMTP Host</label>
                  <input
                    type="text"
                    name="host"
                    value={config.host}
                    onChange={handleChange}
                    placeholder="smtp.example.com"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
                    required
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Port</label>
                  <input
                    type="number"
                    name="port"
                    value={config.port}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={config.username}
                    onChange={handleChange}
                    placeholder="your-email@example.com"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={config.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">From Email</label>
                  <input
                    type="email"
                    name="fromEmail"
                    value={config.fromEmail}
                    onChange={handleChange}
                    placeholder="noreply@yourcompany.com"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">From Name</label>
                  <input
                    type="text"
                    name="fromName"
                    value={config.fromName}
                    onChange={handleChange}
                    placeholder="Your Company Name"
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="mt-4 px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] inline-flex items-center gap-2">
                <MdSave />
                Save Configuration
              </button>
            </form>
          </div>

          {/* Test Email Card */}
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <MdSend className="text-[var(--primary-color)]" size={20} />
              <h5 className="font-semibold m-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">Test Email Configuration</h5>
            </div>
            <p className="text-[var(--text-secondary)] mb-3">
              Send a test email to verify your SMTP configuration is working correctly.
            </p>

            <form onSubmit={handleTest}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Test Email Address</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
                  required
                />
              </div>

              <button type="submit" disabled={isTesting} className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--info-color)] text-[var(--info-color)] hover:bg-[var(--info-color)]/10 dark:hover:bg-[var(--info-color)]/20 inline-flex items-center gap-2 disabled:opacity-50">
                <MdSend />
                {isTesting ? "Sending..." : "Send Test Email"}
              </button>
            </form>

            {testResult && (
              <div className={`mt-3 px-4 py-3 rounded-md border-l-4 ${testResult.success ? 'border-[var(--success-color)] bg-[var(--success-light)]' : 'border-[var(--danger-color)] bg-[var(--danger-light)]'}`}>
                <p className={`flex items-center gap-2 m-0 ${testResult.success ? 'text-[var(--success-color)]' : 'text-[var(--danger-color)]'}`}>
                  <MdInfo />
                  {testResult.message}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          {/* Help Card */}
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="mb-4 pb-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="font-semibold m-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">Common SMTP Settings</h5>
            </div>
            <div>
              <div className="mb-4">
                <h6 className="font-semibold mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Gmail</h6>
                <small className="text-[var(--text-secondary)]">
                  Host: smtp.gmail.com
                  <br />
                  Port: 587 (TLS) or 465 (SSL)
                  <br />
                  Use App Password for 2FA accounts
                </small>
              </div>

              <div className="mb-4">
                <h6 className="font-semibold mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Outlook/Hotmail</h6>
                <small className="text-[var(--text-secondary)]">
                  Host: smtp-mail.outlook.com
                  <br />
                  Port: 587 (TLS)
                </small>
              </div>

              <div className="mb-4">
                <h6 className="font-semibold mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Yahoo</h6>
                <small className="text-[var(--text-secondary)]">
                  Host: smtp.mail.yahoo.com
                  <br />
                  Port: 587 (TLS) or 465 (SSL)
                </small>
              </div>

              <div className="px-4 py-3 rounded-md border-l-4 border-[var(--info-color)] bg-[var(--info-light)]">
                <p className="flex items-start gap-2 m-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  <MdInfo className="text-[var(--info-color)] mt-0.5 flex-shrink-0" />
                  <small>
                    <strong>Note:</strong> Make sure to enable "Less secure app access" or use App Passwords for Gmail
                    accounts with 2FA enabled.
                  </small>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SMTPConfig
