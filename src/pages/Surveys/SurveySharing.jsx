// src\pages\Surveys\SurveySharing.jsx

"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { MdShare, MdLink, MdQrCode, MdEmail, MdContentCopy, MdDownload, MdSecurity } from "react-icons/md"

const SurveySharing = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [survey, setSurvey] = useState(null)
  const [activeTab, setActiveTab] = useState("link")
  const [shareSettings, setShareSettings] = useState({
    isPublic: true,
    requirePassword: false,
    password: "",
    allowAnonymous: true,
    requireRegistration: false,
    maxResponses: "",
    expiryDate: "",
    allowMultipleResponses: false,
  })

  useEffect(() => {
    setTimeout(() => {
      setSurvey({
        id: id,
        title: "Customer Satisfaction Survey",
        url: `https://ratepro.com/survey/${id}`,
        embedCode: `<iframe src="https://ratepro.com/survey/${id}" width="100%" height="600" frameborder="0"></iframe>`,
      })
      setLoading(false)
    }, 1000)
  }, [id])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateQRCode = () => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(survey.url)}`
    return qrCodeUrl
  }

  const downloadQRCode = () => {
    const link = document.createElement("a")
    link.href = generateQRCode()
    link.download = `survey-${id}-qr-code.png`
    link.click()
  }

  const handleSettingChange = (field, value) => {
    setShareSettings((prev) => ({ ...prev, [field]: value }))
  }

  const saveSettings = () => {
    console.log("Saving share settings:", shareSettings)
    alert("Share settings saved successfully!")
  }

  const tabs = [
    { key: "link", label: "Direct Link", icon: MdLink },
    { key: "qr", label: "QR Code", icon: MdQrCode },
    { key: "embed", label: "Embed Code", icon: MdShare },
    { key: "email", label: "Email Invitation", icon: MdEmail },
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <span className="inline-block w-8 h-8 border-3 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-[var(--secondary-color)]">Loading sharing options...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Share Survey</h1>
          <p className="text-[var(--secondary-color)] text-sm">{survey.title}</p>
        </div>
        <button onClick={saveSettings} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white transition-all duration-200">
          <MdSecurity size={16} />
          Save Settings
        </button>
      </div>

      {copied && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
          Link copied to clipboard!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sharing Options */}
        <div className="lg:col-span-2">
          <div className="card border-0 shadow-sm rounded-xl overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] bg-transparent px-4">
              <div className="flex gap-1 -mb-px overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all duration-200
                      ${activeTab === tab.key
                        ? "border-[var(--primary-color)] text-[var(--primary-color)]"
                        : "border-transparent text-[var(--secondary-color)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)]"
                      }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {/* Direct Link Tab */}
              {activeTab === "link" && (
                <div>
                  <div className="mb-6">
                    <h5 className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Survey Link</h5>
                    <p className="text-[var(--secondary-color)] text-sm mb-3">Share this link with your audience to collect responses</p>

                    <div className="flex mb-3">
                      <input type="text" value={survey.url} readOnly className="flex-1 px-3 py-2 rounded-l-lg border border-r-0 border-[var(--light-border)] dark:border-[var(--dark-border)] bg-gray-50 dark:bg-gray-800 text-[var(--light-text)] dark:text-[var(--dark-text)] text-sm font-mono" />
                      <button onClick={() => copyToClipboard(survey.url)} className="px-3 py-2 rounded-r-lg border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 transition-all">
                        <MdContentCopy />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <a href={survey.url} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white transition-all no-underline">Open Survey</a>
                      <button onClick={() => copyToClipboard(survey.url)} className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Copy Link</button>
                    </div>
                  </div>

                  <div>
                    <h6 className="font-semibold text-sm mb-2">Social Media Sharing</h6>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(survey.url)}`, color: "text-blue-600 border-blue-300 hover:bg-blue-50" },
                        { label: "Twitter", href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(survey.url)}&text=Please take our survey`, color: "text-sky-500 border-sky-300 hover:bg-sky-50" },
                        { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(survey.url)}`, color: "text-green-600 border-green-300 hover:bg-green-50" },
                        { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`Please take our survey: ${survey.url}`)}`, color: "text-green-500 border-green-300 hover:bg-green-50" },
                      ].map((item) => (
                        <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${item.color} transition-all no-underline`}>
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* QR Code Tab */}
              {activeTab === "qr" && (
                <div className="text-center">
                  <h5 className="font-semibold mb-1">QR Code</h5>
                  <p className="text-[var(--secondary-color)] text-sm mb-4">Let users scan this QR code to access your survey</p>
                  <div className="mb-4">
                    <img src={generateQRCode() || "/placeholder.svg"} alt="Survey QR Code" className="border rounded-lg mx-auto" style={{ maxWidth: "200px" }} />
                  </div>
                  <div className="flex justify-center gap-2 mb-6">
                    <button onClick={downloadQRCode} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white transition-all">
                      <MdDownload size={16} /> Download QR Code
                    </button>
                    <button onClick={() => copyToClipboard(survey.url)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                      <MdContentCopy size={16} /> Copy Link
                    </button>
                  </div>
                  <div>
                    <h6 className="font-semibold text-sm mb-2">QR Code Usage Tips</h6>
                    <ul className="text-left text-[var(--secondary-color)] text-sm list-disc pl-5 space-y-1">
                      <li>Print on business cards, flyers, or posters</li>
                      <li>Display on digital screens or presentations</li>
                      <li>Include in email signatures</li>
                      <li>Add to product packaging</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Embed Code Tab */}
              {activeTab === "embed" && (
                <div>
                  <h5 className="font-semibold mb-1">Embed Survey</h5>
                  <p className="text-[var(--secondary-color)] text-sm mb-4">Embed this survey directly into your website</p>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Iframe Embed Code</label>
                    <textarea rows={4} value={survey.embedCode} readOnly className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-gray-50 dark:bg-gray-800 text-[var(--light-text)] dark:text-[var(--dark-text)] text-sm font-mono" />
                    <small className="text-[var(--secondary-color)] text-xs">Copy and paste this code into your website's HTML</small>
                  </div>
                  <div className="flex gap-2 mb-6">
                    <button onClick={() => copyToClipboard(survey.embedCode)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white transition-all">
                      <MdContentCopy size={16} /> Copy Embed Code
                    </button>
                  </div>
                  <div>
                    <h6 className="font-semibold text-sm mb-3">Customization Options</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Width</label>
                        <input type="text" defaultValue="100%" className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Height</label>
                        <input type="text" defaultValue="600px" className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm" />
                      </div>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-[var(--primary-color)]" />
                      <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">Remove border</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Email Invitation Tab */}
              {activeTab === "email" && (
                <div>
                  <h5 className="font-semibold mb-1">Email Invitation</h5>
                  <p className="text-[var(--secondary-color)] text-sm mb-4">Send survey invitations via email</p>
                  <form>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Email Template</label>
                      <select className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm">
                        <option>Default Invitation</option>
                        <option>Friendly Reminder</option>
                        <option>Professional Request</option>
                        <option>Custom Template</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Subject Line</label>
                      <input type="text" defaultValue="We'd love your feedback - Quick Survey" className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm" />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Email Content</label>
                      <textarea
                        rows={6}
                        defaultValue={`Hi there,\n\nWe hope you're doing well! We'd love to hear your thoughts and feedback to help us improve our services.\n\nCould you please take a few minutes to complete our survey? It should only take about 3-5 minutes of your time.\n\n[Survey Link]\n\nThank you for your time and valuable feedback!\n\nBest regards,\nThe Rate Pro Team`}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm resize-y"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Recipients</label>
                      <textarea rows={3} placeholder="Enter email addresses separated by commas or upload a CSV file" className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm resize-y" />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button type="button" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white transition-all">
                        <MdEmail size={16} /> Send Invitations
                      </button>
                      <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Upload CSV</button>
                      <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium border border-sky-300 text-sky-600 hover:bg-sky-50 transition-all">Preview Email</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Share Settings */}
        <div className="space-y-4">
          <div className="card border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h6 className="font-semibold text-sm m-0">Share Settings</h6>
            </div>
            <div className="p-4 space-y-4">
              {[
                { field: "isPublic", label: "Make survey public", hint: "Anyone with the link can access the survey" },
                { field: "requirePassword", label: "Require password" },
                { field: "allowAnonymous", label: "Allow anonymous responses" },
                { field: "requireRegistration", label: "Require user registration" },
                { field: "allowMultipleResponses", label: "Allow multiple responses per user" },
              ].map((item) => (
                <div key={item.field}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={shareSettings[item.field]}
                        onChange={(e) => handleSettingChange(item.field, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-[var(--primary-color)] transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                    </div>
                    <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{item.label}</span>
                  </label>
                  {item.hint && <small className="text-[var(--secondary-color)] text-xs ml-12 block mt-0.5">{item.hint}</small>}
                  {item.field === "requirePassword" && shareSettings.requirePassword && (
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={shareSettings.password}
                      onChange={(e) => handleSettingChange("password", e.target.value)}
                      className="w-full mt-2 px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm"
                    />
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Maximum responses</label>
                <input type="number" placeholder="Leave empty for unlimited" value={shareSettings.maxResponses} onChange={(e) => handleSettingChange("maxResponses", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Expiry date</label>
                <input type="datetime-local" value={shareSettings.expiryDate} onChange={(e) => handleSettingChange("expiryDate", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-sm" />
              </div>
            </div>
          </div>

          {/* Survey Statistics */}
          <div className="card border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h6 className="font-semibold text-sm m-0">Survey Statistics</h6>
            </div>
            <div className="p-4 space-y-2">
              {[
                { label: "Total Views:", value: "1,234" },
                { label: "Responses:", value: "456" },
                { label: "Completion Rate:", value: "87%" },
                { label: "Last Response:", value: "2 hours ago" },
              ].map((stat) => (
                <div key={stat.label} className="flex justify-between text-sm">
                  <span className="text-[var(--secondary-color)]">{stat.label}</span>
                  <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{stat.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SurveySharing
