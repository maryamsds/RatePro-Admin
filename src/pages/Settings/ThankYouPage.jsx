// src\pages\Settings\ThankYouPage.jsx

"use client"

import { useState } from "react"
import { MdCheck, MdSave } from "react-icons/md"

const ThankYouPage = () => {
  const [settings, setSettings] = useState({
    title: "Thank You!",
    message: "Thank you for completing our survey. Your feedback is valuable to us.",
    redirectUrl: "",
    redirectDelay: 5,
    showSocialShare: true,
    customCss: "",
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    console.log("Thank You page settings saved:", settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="w-full min-h-screen py-6 px-4 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
      <div className="flex justify-center">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[var(--primary-color)] mb-2">Thank You Page</h1>
            <p className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Customize the thank you page that users see after completing a survey</p>
          </div>

          {saved && (
            <div className="flex items-center gap-2 p-4 mb-6 bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--success-color)] rounded-md text-[var(--success-color)]">
              <MdCheck size={20} />
              <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Thank you page settings saved successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Settings Form */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <h5 className="font-semibold text-lg text-[var(--light-text)] dark:text-[var(--dark-text)] m-0">Page Settings</h5>
              </div>
              <div className="p-6">
                <form>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Page Title</label>
                    <input
                      type="text"
                      value={settings.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="Enter page title"
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Thank You Message</label>
                    <textarea
                      rows={4}
                      value={settings.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="Enter thank you message"
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors resize-y"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Redirect URL (Optional)</label>
                    <input
                      type="url"
                      value={settings.redirectUrl}
                      onChange={(e) => handleChange("redirectUrl", e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors"
                    />
                    <small className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60 mt-1 block">
                      Leave empty to show the thank you page without redirect
                    </small>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Redirect Delay (seconds)</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={settings.redirectDelay}
                      onChange={(e) => handleChange("redirectDelay", Number.parseInt(e.target.value))}
                      disabled={!settings.redirectUrl}
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showSocialShare}
                        onChange={(e) => handleChange("showSocialShare", e.target.checked)}
                        className="w-4 h-4 rounded border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)] bg-[var(--light-card)] dark:bg-[var(--dark-card)]"
                      />
                      <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">Show social sharing buttons</span>
                    </label>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Custom CSS (Optional)</label>
                    <textarea
                      rows={4}
                      value={settings.customCss}
                      onChange={(e) => handleChange("customCss", e.target.value)}
                      placeholder="/* Custom CSS styles */"
                      className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-colors font-mono text-sm resize-y"
                    />
                  </div>

                  <button 
                    type="button" 
                    onClick={handleSave} 
                    className="w-full px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] inline-flex items-center justify-center gap-2"
                  >
                    <MdSave size={18} />
                    Save Settings
                  </button>
                </form>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <h5 className="font-semibold text-lg text-[var(--light-text)] dark:text-[var(--dark-text)] m-0">Preview</h5>
              </div>
              <div className="p-6">
                <div className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]" style={{ minHeight: "400px" }}>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--success-color)] flex items-center justify-center mx-auto mb-4">
                      <MdCheck className="text-white" size={32} />
                    </div>

                    <h2 className="text-xl font-semibold mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{settings.title}</h2>
                    <p className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 mb-6">{settings.message}</p>

                    {settings.showSocialShare && (
                      <div className="mb-6">
                        <p className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 mb-3">Share this survey:</p>
                        <div className="flex justify-center gap-3">
                          <button className="px-4 py-2 text-sm rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]">
                            Facebook
                          </button>
                          <button className="px-4 py-2 text-sm rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]">
                            Twitter
                          </button>
                          <button className="px-4 py-2 text-sm rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]">
                            WhatsApp
                          </button>
                        </div>
                      </div>
                    )}

                    {settings.redirectUrl && (
                      <div className="mt-6">
                        <p className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 mb-3">
                          Redirecting to {settings.redirectUrl} in {settings.redirectDelay} seconds...
                        </p>
                        <div className="w-full bg-[var(--light-border)] dark:bg-[var(--dark-border)] rounded-full h-2 overflow-hidden">
                          <div className="h-2 rounded-full bg-[var(--primary-color)] transition-all" style={{ width: "60%" }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {settings.customCss && (
                  <div className="mt-4">
                    <small className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60">Custom CSS will be applied to the actual page</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThankYouPage
